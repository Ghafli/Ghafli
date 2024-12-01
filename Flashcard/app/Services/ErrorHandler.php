<?php

namespace App\Services;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\FirebaseHandler;
use Monolog\Formatter\JsonFormatter;
use Exception;
use Throwable;

class ErrorHandler {
    private $logger;
    private $isProduction;

    public function __construct() {
        $this->isProduction = getenv('APP_ENV') === 'production';
        $this->initializeLogger();
        $this->registerHandlers();
    }

    /**
     * Initialize the logger with appropriate handlers
     */
    private function initializeLogger() {
        $this->logger = new Logger('flashcard-app');

        // Add file handler for all environments
        $fileHandler = new StreamHandler(
            __DIR__ . '/../../logs/app.log',
            $this->isProduction ? Logger::ERROR : Logger::DEBUG
        );
        $fileHandler->setFormatter(new JsonFormatter());
        $this->logger->pushHandler($fileHandler);

        // Add Firebase logging in production
        if ($this->isProduction) {
            $firebaseHandler = new FirebaseHandler(
                $this->getFirebaseConfig(),
                Logger::ERROR
            );
            $this->logger->pushHandler($firebaseHandler);
        }
    }

    /**
     * Register error and exception handlers
     */
    private function registerHandlers() {
        set_error_handler([$this, 'handleError']);
        set_exception_handler([$this, 'handleException']);
        register_shutdown_function([$this, 'handleShutdown']);
    }

    /**
     * Handle PHP errors
     */
    public function handleError($severity, $message, $file, $line) {
        if (!(error_reporting() & $severity)) {
            return false;
        }

        $this->logError('Error', [
            'severity' => $severity,
            'message' => $message,
            'file' => $file,
            'line' => $line
        ]);

        if ($this->isProduction) {
            $this->showProductionError();
            return true;
        }

        return false;
    }

    /**
     * Handle uncaught exceptions
     */
    public function handleException(Throwable $exception) {
        $this->logError('Exception', [
            'type' => get_class($exception),
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString()
        ]);

        if ($this->isProduction) {
            $this->showProductionError();
            return;
        }

        // Show detailed error in development
        $this->showDevelopmentError($exception);
    }

    /**
     * Handle fatal errors
     */
    public function handleShutdown() {
        $error = error_get_last();
        
        if ($error !== null && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE])) {
            $this->logError('Fatal Error', [
                'type' => $error['type'],
                'message' => $error['message'],
                'file' => $error['file'],
                'line' => $error['line']
            ]);

            if ($this->isProduction) {
                $this->showProductionError();
            }
        }
    }

    /**
     * Log error details
     */
    private function logError($type, $details) {
        $this->logger->error($type, array_merge($details, [
            'url' => $_SERVER['REQUEST_URI'] ?? 'unknown',
            'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'timestamp' => date('Y-m-d H:i:s')
        ]));
    }

    /**
     * Show production-safe error page
     */
    private function showProductionError() {
        http_response_code(500);
        include __DIR__ . '/../../public/error.html';
        exit;
    }

    /**
     * Show detailed error page in development
     */
    private function showDevelopmentError(Throwable $exception) {
        http_response_code(500);
        include __DIR__ . '/../../public/error_dev.html';
        exit;
    }

    /**
     * Get Firebase configuration
     */
    private function getFirebaseConfig() {
        return [
            'apiKey' => getenv('FIREBASE_API_KEY'),
            'projectId' => getenv('FIREBASE_PROJECT_ID'),
            'databaseURL' => getenv('FIREBASE_DATABASE_URL')
        ];
    }
}
