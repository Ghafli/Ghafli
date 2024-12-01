<?php

// Bootstrap the application
require __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Initialize the application
$app = require_once __DIR__ . '/../bootstrap/app.php';

// Run the application
$app->run();
