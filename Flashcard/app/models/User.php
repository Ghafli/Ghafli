<?php

namespace App\Models;

class User
{
    private $id;
    private $email;
    private $displayName;
    private $createdAt;
    private $firebase;

    public function __construct(array $data = [])
    {
        $this->firebase = new \App\Services\FirebaseService();
        $this->hydrate($data);
    }

    private function hydrate(array $data)
    {
        foreach ($data as $key => $value) {
            $method = 'set' . ucfirst($key);
            if (method_exists($this, $method)) {
                $this->$method($value);
            }
        }
    }

    // Getters
    public function getId() { return $this->id; }
    public function getEmail() { return $this->email; }
    public function getDisplayName() { return $this->displayName; }
    public function getCreatedAt() { return $this->createdAt; }

    // Setters
    public function setId($id) { $this->id = $id; }
    public function setEmail($email) { $this->email = $email; }
    public function setDisplayName($name) { $this->displayName = $name; }
    public function setCreatedAt($date) { $this->createdAt = $date; }

    // Firebase Operations
    public function save()
    {
        $data = [
            'email' => $this->email,
            'displayName' => $this->displayName,
            'createdAt' => $this->createdAt ?? time()
        ];

        return $this->firebase->save("users/{$this->id}", $data);
    }

    public function update(array $data)
    {
        return $this->firebase->update("users/{$this->id}", $data);
    }

    public static function findById($id)
    {
        $firebase = new \App\Services\FirebaseService();
        $data = $firebase->get("users/{$id}");
        if ($data) {
            $data['id'] = $id;
            return new self($data);
        }
        return null;
    }

    public function getFlashcards()
    {
        return $this->firebase->get("users/{$this->id}/flashcards");
    }
}
