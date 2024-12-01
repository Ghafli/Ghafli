<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\ServiceAccount;

class FirebaseService
{
    private $firebase;
    private $database;
    private $auth;

    public function __construct()
    {
        $serviceAccountPath = __DIR__ . '/../../config/firebase-credentials.json';
        
        $factory = (new Factory)
            ->withServiceAccount($serviceAccountPath)
            ->withDatabaseUri($_ENV['FIREBASE_DATABASE_URL']);

        $this->firebase = $factory->createDatabase();
        $this->auth = $factory->createAuth();
    }

    /**
     * Get Firebase Database instance
     */
    public function getDatabase()
    {
        return $this->firebase;
    }

    /**
     * Get Firebase Auth instance
     */
    public function getAuth()
    {
        return $this->auth;
    }

    /**
     * Create a new user
     */
    public function createUser(string $email, string $password, array $additionalUserInfo = [])
    {
        $userProperties = [
            'email' => $email,
            'password' => $password,
            'emailVerified' => false,
        ];

        if (!empty($additionalUserInfo)) {
            $userProperties = array_merge($userProperties, $additionalUserInfo);
        }

        return $this->auth->createUser($userProperties);
    }

    /**
     * Get user by ID
     */
    public function getUser(string $uid)
    {
        return $this->auth->getUser($uid);
    }

    /**
     * Update user profile
     */
    public function updateUser(string $uid, array $properties)
    {
        return $this->auth->updateUser($uid, $properties);
    }

    /**
     * Delete user
     */
    public function deleteUser(string $uid)
    {
        return $this->auth->deleteUser($uid);
    }

    /**
     * Save data to database
     */
    public function save(string $path, array $data)
    {
        return $this->firebase->getReference($path)->set($data);
    }

    /**
     * Update data in database
     */
    public function update(string $path, array $data)
    {
        return $this->firebase->getReference($path)->update($data);
    }

    /**
     * Get data from database
     */
    public function get(string $path)
    {
        return $this->firebase->getReference($path)->getValue();
    }

    /**
     * Delete data from database
     */
    public function delete(string $path)
    {
        return $this->firebase->getReference($path)->remove();
    }
}
