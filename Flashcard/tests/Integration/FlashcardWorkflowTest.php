<?php

namespace Tests\Integration;

use App\Services\FlashcardService;
use App\Services\SpacedRepetitionService;
use App\Services\ProgressService;
use PHPUnit\Framework\TestCase;
use Kreait\Firebase\Factory;

class FlashcardWorkflowTest extends TestCase
{
    private $flashcardService;
    private $spacedRepetitionService;
    private $progressService;
    private $testDeckId;
    private $testCardId;

    protected function setUp(): void
    {
        parent::setUp();

        // Initialize Firebase with test credentials
        $factory = (new Factory)
            ->withServiceAccount($_ENV['FIREBASE_CREDENTIALS']);
        
        $firebase = $factory->createDatabase();

        // Initialize services
        $this->flashcardService = new FlashcardService($firebase);
        $this->spacedRepetitionService = new SpacedRepetitionService($firebase);
        $this->progressService = new ProgressService($firebase);

        // Create test deck and card
        $this->testDeckId = $this->createTestDeck();
        $this->testCardId = $this->createTestCard();
    }

    protected function tearDown(): void
    {
        // Clean up test data
        $this->cleanupTestData();
        parent::tearDown();
    }

    public function testCompleteStudyWorkflow()
    {
        // 1. Create a new flashcard
        $cardData = [
            'front' => 'Integration Test Question',
            'back' => 'Integration Test Answer',
            'deckId' => $this->testDeckId,
            'tags' => ['integration', 'test']
        ];

        $cardId = $this->flashcardService->createFlashcard($cardData);
        $this->assertNotEmpty($cardId);

        // 2. Study the card
        $studyResult = [
            'cardId' => $cardId,
            'quality' => 4, // Good response
            'timeSpent' => 15 // seconds
        ];

        $result = $this->spacedRepetitionService->processStudyResult($studyResult);
        $this->assertTrue($result);

        // 3. Verify progress is recorded
        $progress = $this->progressService->getCardProgress($cardId);
        $this->assertNotNull($progress);
        $this->assertEquals(4, $progress['lastQuality']);
        $this->assertGreaterThan(0, $progress['nextReview']);

        // 4. Update the card
        $updateData = [
            'front' => 'Updated Integration Test Question',
            'back' => 'Updated Integration Test Answer'
        ];

        $updateResult = $this->flashcardService->updateFlashcard($cardId, $updateData);
        $this->assertTrue($updateResult);

        // 5. Verify the update
        $updatedCard = $this->flashcardService->getFlashcard($cardId);
        $this->assertEquals($updateData['front'], $updatedCard['front']);
        $this->assertEquals($updateData['back'], $updatedCard['back']);

        // 6. Study the card again
        $secondStudyResult = [
            'cardId' => $cardId,
            'quality' => 5, // Perfect response
            'timeSpent' => 10 // seconds
        ];

        $result = $this->spacedRepetitionService->processStudyResult($secondStudyResult);
        $this->assertTrue($result);

        // 7. Verify progress is updated
        $updatedProgress = $this->progressService->getCardProgress($cardId);
        $this->assertEquals(5, $updatedProgress['lastQuality']);
        $this->assertGreaterThan($progress['nextReview'], $updatedProgress['nextReview']);

        // 8. Delete the card
        $deleteResult = $this->flashcardService->deleteFlashcard($cardId);
        $this->assertTrue($deleteResult);

        // 9. Verify card is deleted
        $deletedCard = $this->flashcardService->getFlashcard($cardId);
        $this->assertNull($deletedCard);
    }

    private function createTestDeck()
    {
        $deckData = [
            'name' => 'Integration Test Deck',
            'description' => 'Test deck for integration testing'
        ];

        return $this->flashcardService->createDeck($deckData);
    }

    private function createTestCard()
    {
        $cardData = [
            'front' => 'Initial Test Question',
            'back' => 'Initial Test Answer',
            'deckId' => $this->testDeckId
        ];

        return $this->flashcardService->createFlashcard($cardData);
    }

    private function cleanupTestData()
    {
        // Delete test card if it exists
        if ($this->testCardId) {
            $this->flashcardService->deleteFlashcard($this->testCardId);
        }

        // Delete test deck if it exists
        if ($this->testDeckId) {
            $this->flashcardService->deleteDeck($this->testDeckId);
        }
    }
}
