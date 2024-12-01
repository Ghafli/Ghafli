<?php

namespace App\Controllers;

class Controller
{
    protected function render($view, $data = [])
    {
        // Extract data to make variables available in view
        extract($data);
        
        // Start output buffering
        ob_start();
        
        // Include the view file
        $viewPath = __DIR__ . "/../Views/{$view}.php";
        if (file_exists($viewPath)) {
            require $viewPath;
        } else {
            throw new \Exception("View {$view} not found");
        }
        
        // Get contents and clean buffer
        $content = ob_get_clean();
        
        // Include the layout
        require __DIR__ . "/../Views/layouts/main.php";
    }

    protected function json($data)
    {
        header('Content-Type: application/json');
        echo json_encode($data);
    }

    protected function redirect($url)
    {
        header("Location: {$url}");
        exit;
    }

    protected function getCurrentUser()
    {
        if (isset($_SESSION['user_id'])) {
            return \App\Models\User::findById($_SESSION['user_id']);
        }
        return null;
    }

    protected function requireAuth()
    {
        if (!$this->getCurrentUser()) {
            $this->redirect('/login');
        }
    }
}
