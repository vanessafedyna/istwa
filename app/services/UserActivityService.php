<?php
declare(strict_types=1);

final class UserActivityService
{
    private const ALLOWED_ACTIVITY_TYPES = [
        'timeline_period_view',
        'hero_view',
    ];

    public function validateAndPrepareTrackPayload(array $payload): array
    {
        $activityType = $this->requireActivityType($payload);
        $targetKey = $this->requireTargetKey($payload);

        return [
            'activity_type' => $activityType,
            'target_key' => $targetKey,
            'metadata_json' => null,
        ];
    }

    private function requireActivityType(array $payload): string
    {
        if (!array_key_exists('activity_type', $payload)) {
            throw new InvalidArgumentException('The "activity_type" field is required.');
        }

        $activityType = trim((string) $payload['activity_type']);

        if ($activityType === '' || !in_array($activityType, self::ALLOWED_ACTIVITY_TYPES, true)) {
            throw new InvalidArgumentException('The "activity_type" field is invalid.');
        }

        return $activityType;
    }

    private function requireTargetKey(array $payload): string
    {
        if (!array_key_exists('target_key', $payload)) {
            throw new InvalidArgumentException('The "target_key" field is required.');
        }

        $targetKey = trim((string) $payload['target_key']);

        if ($targetKey === '') {
            throw new InvalidArgumentException('The "target_key" field is required.');
        }

        if (strlen($targetKey) > 120) {
            throw new InvalidArgumentException('The "target_key" field is too long.');
        }

        return $targetKey;
    }
}
