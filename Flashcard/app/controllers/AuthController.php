<?php

namespace App\Controllers;

use App\Models\User;
use App\Services\FirebaseService;

class AuthController extends Controller
{
    private $firebase;

    public function __construct()
    {
        session_start();
        $this->firebase = new FirebaseService();
    }

    public function showLogin()
    {
        if ($this->getCurrentUser()) {
            $this->redirect('/flashcards');
        }
        $this->render('auth/login');
    }

    public function login()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->redirect('/login');
        }

        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';

        try {
            $auth = $this->firebase->getAuth();
            $signInResult = $auth->signInWithEmailAndPassword($email, $password);
            
            // Store user data in session
            $_SESSION['user_id'] = $signInResult->uid;
            $_SESSION['email'] = $signInResult->email;
            
            $this->redirect('/flashcards');
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Invalid email or password';
            $this->redirect('/login');
        }
    }

    public function showRegister()
    {
        if ($this->getCurrentUser()) {
            $this->redirect('/flashcards');
        }
        $this->render('auth/register');
    }

    public function register()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->redirect('/register');
        }

        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        $confirmPassword = $_POST['confirm_password'] ?? '';
        $displayName = $_POST['display_name'] ?? '';

        // Validate password match
        if ($password !== $confirmPassword) {
            $_SESSION['error'] = 'Passwords do not match';
            $this->redirect('/register');
            return;
        }

        try {
            $auth = $this->firebase->getAuth();
            $userProperties = [
                'email' => $email,
                'emailVerified' => false,
                'password' => $password,
                'displayName' => $displayName,
            ];
            
            $createdUser = $auth->createUser($userProperties);
            
            // Create user profile in database
            $user = new User([
                'id' => $createdUser->uid,
                'email' => $email,
                'displayName' => $displayName,
                'createdAt' => time()
            ]);
            $user->save();

            // Auto-login after registration
            $_SESSION['user_id'] = $createdUser->uid;
            $_SESSION['email'] = $email;
            
            $this->redirect('/flashcards');
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Registration failed: ' . $e->getMessage();
            $this->redirect('/register');
        }
    }

    public function logout()
    {
        session_start();
        session_destroy();
        $this->redirect('/login');
    }

    public function forgotPassword()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = $_POST['email'] ?? '';
            
            try {
                $auth = $this->firebase->getAuth();
                $auth->sendPasswordResetEmail($email);
                $_SESSION['success'] = 'Password reset email has been sent';
                $this->redirect('/login');
            } catch (\Exception $e) {
                $_SESSION['error'] = 'Failed to send password reset email';
                $this->redirect('/forgot-password');
            }
        }
        
        $this->render('auth/forgot-password');
    }
}
