function normalizeWeather(data, fetchedAt) {
    const temperature = data.current.temperature_2m;
    const sourceTime = data.current.time;

    // 조회 시각을 Asia/Seoul 기준 날짜로 변환
    const recordDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date(fetchedAt));

    return {
        signal_id: "busan-temperature",
        normalized_value: temperature,
        unit: "°C",
        source_name: "Open-Meteo",
        source_url:
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=35.1796" +
            "&longitude=129.0756" +
            "&current=temperature_2m" +
            "&timezone=Asia%2FSeoul",
        source_time: sourceTime,
        fetched_at: fetchedAt,
        record_timezone: "Asia/Seoul",
        record_date: recordDate
    };
}

// 오류가 발생했을 때 사용할 상태
function createErrorStatus(errorCode) {
    return {
        freshness: "stale",
        error_code: errorCode
    };
}

function runFixture(fixture) {
    const transport = fixture.transport;

    // 1. timeout
    if (transport.mode === "timeout") {
        return createErrorStatus("timeout");
    }

    // 2. offline
    if (transport.mode === "offline") {
        return createErrorStatus("offline");
    }

    // 3. HTTP 인증 오류
    if (transport.status === 401 || transport.status === 403) {
        return createErrorStatus("auth");
    }

    // 4. 요청 제한
    if (transport.status === 429) {
        return createErrorStatus("rate_limit");
    }

    // 5. 응답 구조 오류
    if (
        !fixture.payload ||
        typeof fixture.payload.normalized_value !== "number" ||
        !fixture.payload.unit ||
        !fixture.payload.source_name ||
        !fixture.payload.source_url ||
        !fixture.payload.source_time ||
        !fixture.payload.fetched_at
    ) {
        return createErrorStatus("schema_error");
    }

    // 정상 응답
    return {
        freshness: "fresh",
        error_code: "none"
    };
}