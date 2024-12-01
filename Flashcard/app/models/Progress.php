<?php

namespace App\Models;

class Progress
{
    private $id;
    private $userId;
    private $cardId;
    private $easeFactor;
    private $interval;
    private $repetitions;
    private $lastReviewed;
    private $nextReview;
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
    public function getCardId() { return $this->cardId; }
    public function getEaseFactor() { return $this->easeFactor; }
    public function getInterval() { return $this->interval; }
    public function getRepetitions() { return $this->repetitions; }
    public function getLastReviewed() { return $this->lastReviewed; }
    public function getNextReview() { return $this->nextReview; }

    // Setters
    public function setId($id) { $this->id = $id; }
    public function setUserId($userId) { $this->userId = $userId; }
    public function setCardId($cardId) { $this->cardId = $cardId; }
    public function setEaseFactor($factor) { $this->easeFactor = $factor; }
    public function setInterval($interval) { $this->interval = $interval; }
    public function setRepetitions($reps) { $this->repetitions = $reps; }
    public function setLastReviewed($date) { $this->lastReviewed = $date; }
    public function setNextReview($date) { $this->nextReview = $date; }

    // Firebase Operations
    public function save()
    {
        $data = [
            'cardId' => $this->cardId,
            'easeFactor' => $this->easeFactor,
            'interval' => $this->interval,
            'repetitions' => $this->repetitions,
            'lastReviewed' => $this->lastReviewed ?? time(),
            'nextReview' => $this->nextReview
        ];

        return $this->firebase->save("users/{$this->userId}/progress/{$this->id}", $data);
    }

    public function update(array $data)
    {
        return $this->firebase->update("users/{$this->userId}/progress/{$this->id}", $data);
    }

    public static function findByCard($userId, $cardId)
    {
        $firebase = new \App\Services\FirebaseService();
        $data = $firebase->get("users/{$userId}/progress/{$cardId}");
        if ($data) {
            $data['id'] = $cardId;
            $data['userId'] = $userId;
            return new self($data);
        }
        return null;
    }

    // Calculate next review date using SuperMemo 2 algorithm
    public function calculateNextReview($quality)
    {
        if ($quality < 0 || $quality > 5) {
            throw new \InvalidArgumentException("Quality must be between 0 and 5");
        }

        if ($quality < 3) {
            $this->repetitions = 0;
            $this->interval = 1;
        } else {
            $this->repetitions++;
            if ($this->repetitions == 1) {
                $this->interval = 1;
            } elseif ($this->repetitions == 2) {
                $this->interval = 6;
            } else {
                $this->interval = ceil($this->interval * $this->easeFactor);
            }
        }

        $this->easeFactor = max(1.3, $this->easeFactor + (0.1 - (5 - $quality) * (0.08 + (5 - $quality) * 0.02)));
        $this->lastReviewed = time();
        $this->nextReview = time() + ($this->interval * 24 * 3600);

        return $this->save();
    }
}
