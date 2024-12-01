<?php

namespace Tests\Unit\Services;

use App\Services\FlashcardService;
use PHPUnit\Framework\TestCase;
use Mockery;
use Kreait\Firebase\Contract\Database;

class FlashcardServiceTest extends TestCase
{
    private $firebaseMock;
    private $flashcardService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->firebaseMock = Mockery::mock(Database::class);
        $this->flashcardService = new FlashcardService($this->firebaseMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function testCreateFlashcard()
    {
        $flashcardData = [
            'front' => 'Test Question',
            'back' => 'Test Answer',
            'deckId' => 'test-deck-1',
            'tags' => ['test', 'unit']
        ];

        $this->firebaseMock->shouldReceive('getReference')
            ->once()
            ->with('flashcards')
            ->andReturn($this->firebaseMock);

        $this->firebaseMock->shouldReceive('push')
            ->once()
            ->with(Mockery::subset($flashcardData))
            ->andReturn(true);

        $result = $this->flashcardService->createFlashcard($flashcardData);
        $this->assertTrue($result);
    }

    public function testGetFlashcard()
    {
        $flashcardId = 'test-card-1';
        $expectedCard = [
            'id' => $flashcardId,
            'front' => 'Test Question',
            'back' => 'Test Answer',
            'deckId' => 'test-deck-1'
        ];

        $this->firebaseMock->shouldReceive('getReference')
            ->once()
            ->with("flashcards/{$flashcardId}")
            ->andReturn($this->firebaseMock);

        $this->firebaseMock->shouldReceive('getValue')
            ->once()
            ->andReturn($expectedCard);

        $result = $this->flashcardService->getFlashcard($flashcardId);
        $this->assertEquals($expectedCard, $result);
    }

    public function testUpdateFlashcard()
    {
        $flashcardId = 'test-card-1';
        $updateData = [
            'front' => 'Updated Question',
            'back' => 'Updated Answer'
        ];

        $this->firebaseMock->shouldReceive('getReference')
            ->once()
            ->with("flashcards/{$flashcardId}")
            ->andReturn($this->firebaseMock);

        $this->firebaseMock->shouldReceive('update')
            ->once()
            ->with($updateData)
            ->andReturn(true);

        $result = $this->flashcardService->updateFlashcard($flashcardId, $updateData);
        $this->assertTrue($result);
    }

    public function testDeleteFlashcard()
    {
        $flashcardId = 'test-card-1';

        $this->firebaseMock->shouldReceive('getReference')
            ->once()
            ->with("flashcards/{$flashcardId}")
            ->andReturn($this->firebaseMock);

        $this->firebaseMock->shouldReceive('remove')
            ->once()
            ->andReturn(true);

        $result = $this->flashcardService->deleteFlashcard($flashcardId);
        $this->assertTrue($result);
    }
}
