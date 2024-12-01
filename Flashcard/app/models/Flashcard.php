<?php

namespace App\Models;

class Flashcard
{
    private $id;
    private $userId;
    private $front;
    private $back;
    private $category;
    private $difficulty;
    private $createdAt;
    private $lastReviewed;
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
    public function getUserId() { return $this->userId; }
    public function getFront() { return $this->front; }
    public function getBack() { return $this->back; }
    public function getCategory() { return $this->category; }
    public function getDifficulty() { return $this->difficulty; }
    public function getCreatedAt() { return $this->createdAt; }
    public function getLastReviewed() { return $this->lastReviewed; }

    // Setters
    public function setId($id) { $this->id = $id; }
    public function setUserId($userId) { $this->userId = $userId; }
    public function setFront($front) { $this->front = $front; }
    public function setBack($back) { $this->back = $back; }
    public function setCategory($category) { $this->category = $category; }
    public function setDifficulty($difficulty) { $this->difficulty = $difficulty; }
    public function setCreatedAt($date) { $this->createdAt = $date; }
    public function setLastReviewed($date) { $this->lastReviewed = $date; }

    // Firebase Operations
    public function save()
    {
        $data = [
            'front' => $this->front,
            'back' => $this->back,
            'category' => $this->category,
            'difficulty' => $this->difficulty,
            'createdAt' => $this->createdAt ?? time(),
            'lastReviewed' => $this->lastReviewed
        ];

        return $this->firebase->save("users/{$this->userId}/flashcards/{$this->id}", $data);
    }

    public function update(array $data)
    {
        return $this->firebase->update("users/{$this->userId}/flashcards/{$this->id}", $data);
    }

    public function delete()
    {
        return $this->firebase->delete("users/{$this->userId}/flashcards/{$this->id}");
    }

    public static function findById($userId, $cardId)
    {
        $firebase = new \App\Services\FirebaseService();
        $data = $firebase->get("users/{$userId}/flashcards/{$cardId}");
        if ($data) {
            $data['id'] = $cardId;
            $data['userId'] = $userId;
            return new self($data);
        }
        return null;
    }

    public static function getAllByUser($userId)
    {
        $firebase = new \App\Services\FirebaseService();
        $cards = $firebase->get("users/{$userId}/flashcards");
        if (!$cards) return [];

        $flashcards = [];
        foreach ($cards as $id => $data) {
            $data['id'] = $id;
            $data['userId'] = $userId;
            $flashcards[] = new self($data);
        }
        return $flashcards;
    }
}
