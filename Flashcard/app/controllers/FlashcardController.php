<?php

namespace App\Controllers;

use App\Models\Flashcard;
use App\Models\Progress;

class FlashcardController extends Controller
{
    public function __construct()
    {
        $this->requireAuth();
    }

    public function index()
    {
        $user = $this->getCurrentUser();
        $flashcards = Flashcard::getAllByUser($user->getId());
        
        $this->render('flashcards/index', [
            'flashcards' => $flashcards
        ]);
    }

    public function create()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user = $this->getCurrentUser();
            
            $flashcard = new Flashcard([
                'userId' => $user->getId(),
                'front' => $_POST['front'],
                'back' => $_POST['back'],
                'category' => $_POST['category'],
                'difficulty' => $_POST['difficulty']
            ]);
            
            if ($flashcard->save()) {
                $this->redirect('/flashcards');
            }
        }
        
        $this->render('flashcards/create');
    }

    public function edit($id)
    {
        $user = $this->getCurrentUser();
        $flashcard = Flashcard::findById($user->getId(), $id);
        
        if (!$flashcard) {
            $this->redirect('/flashcards');
        }
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $flashcard->setFront($_POST['front']);
            $flashcard->setBack($_POST['back']);
            $flashcard->setCategory($_POST['category']);
            $flashcard->setDifficulty($_POST['difficulty']);
            
            if ($flashcard->save()) {
                $this->redirect('/flashcards');
            }
        }
        
        $this->render('flashcards/edit', [
            'flashcard' => $flashcard
        ]);
    }

    public function review()
    {
        $user = $this->getCurrentUser();
        $flashcards = Flashcard::getAllByUser($user->getId());
        $dueCards = [];
        
        foreach ($flashcards as $card) {
            $progress = Progress::findByCard($user->getId(), $card->getId());
            if (!$progress || $progress->getNextReview() <= time()) {
                $dueCards[] = $card;
            }
        }
        
        $this->render('flashcards/review', [
            'cards' => $dueCards
        ]);
    }

    public function updateProgress()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->redirect('/flashcards');
        }

        $user = $this->getCurrentUser();
        $cardId = $_POST['card_id'];
        $quality = (int)$_POST['quality'];

        $progress = Progress::findByCard($user->getId(), $cardId);
        if (!$progress) {
            $progress = new Progress([
                'userId' => $user->getId(),
                'cardId' => $cardId,
                'easeFactor' => 2.5,
                'interval' => 0,
                'repetitions' => 0
            ]);
        }

        $progress->calculateNextReview($quality);
        $this->redirect('/flashcards/review');
    }

    public function delete($id)
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user = $this->getCurrentUser();
            $flashcard = Flashcard::findById($user->getId(), $id);
            
            if ($flashcard) {
                $flashcard->delete();
            }
        }
        
        $this->redirect('/flashcards');
    }
}
