<?php
declare(strict_types=1);

final class QuizService
{
    public function validateAndPrepareAttempt(array $payload): array
    {
        $score = $this->requireInteger($payload, 'score', 0);
        $totalQuestions = $this->requireInteger($payload, 'total_questions', 1);

        if ($score > $totalQuestions) {
            throw new InvalidArgumentException('The "score" field cannot be greater than "total_questions".');
        }

        $answersJson = $this->requireAnswersJson($payload);
        $language = $this->requireString($payload, 'language');
        $completedAt = $this->requireDateTime($payload, 'completed_at');
        $quizKey = $this->optionalString($payload, 'quiz_key', 'main_quiz');

        return [
            'user_id' => null,
            'quiz_key' => $quizKey,
            'score' => $score,
            'total_questions' => $totalQuestions,
            'answers_json' => $answersJson,
            'language' => $language,
            'completed_at' => $completedAt,
        ];
    }

    private function requireInteger(array $payload, string $key, int $minimumValue): int
    {
        if (!array_key_exists($key, $payload)) {
            throw new InvalidArgumentException(sprintf('The "%s" field is required.', $key));
        }

        if (filter_var($payload[$key], FILTER_VALIDATE_INT) === false) {
            throw new InvalidArgumentException(sprintf('The "%s" field must be an integer.', $key));
        }

        $value = (int) $payload[$key];

        if ($value < $minimumValue) {
            throw new InvalidArgumentException(sprintf('The "%s" field is invalid.', $key));
        }

        return $value;
    }

    private function requireString(array $payload, string $key): string
    {
        if (!array_key_exists($key, $payload)) {
            throw new InvalidArgumentException(sprintf('The "%s" field is required.', $key));
        }

        $value = trim((string) $payload[$key]);

        if ($value === '') {
            throw new InvalidArgumentException(sprintf('The "%s" field is required.', $key));
        }

        return $value;
    }

    private function optionalString(array $payload, string $key, string $defaultValue): string
    {
        if (!array_key_exists($key, $payload)) {
            return $defaultValue;
        }

        $value = trim((string) $payload[$key]);

        return $value === '' ? $defaultValue : $value;
    }

    private function requireAnswersJson(array $payload): string
    {
        if (!array_key_exists('answers_json', $payload)) {
            throw new InvalidArgumentException('The "answers_json" field is required.');
        }

        $answers = $payload['answers_json'];

        if (is_string($answers)) {
            try {
                json_decode($answers, true, 512, JSON_THROW_ON_ERROR);
            } catch (JsonException $exception) {
                throw new InvalidArgumentException('The "answers_json" field must contain valid JSON.');
            }

            return $answers;
        }

        if (is_array($answers)) {
            return json_encode($answers, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        }

        throw new InvalidArgumentException('The "answers_json" field must be a JSON string or an array.');
    }

    private function requireDateTime(array $payload, string $key): string
    {
        $value = $this->requireString($payload, $key);
        $timestamp = strtotime($value);

        if ($timestamp === false) {
            throw new InvalidArgumentException(sprintf('The "%s" field must be a valid date.', $key));
        }

        return date('Y-m-d H:i:s', $timestamp);
    }
}
