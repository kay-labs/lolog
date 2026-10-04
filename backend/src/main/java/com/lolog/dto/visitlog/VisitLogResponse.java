package com.lolog.dto.visitlog;

import com.lolog.domain.VisitLog;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class VisitLogResponse {

    private final Long id;
    private final String ip;
    private final String path;
    private final String userAgent;
    private final LocalDateTime visitedAt;

    public VisitLogResponse(VisitLog visitLog) {
        this.id = visitLog.getId();
        this.ip = visitLog.getIp();
        this.path = visitLog.getPath();
        this.userAgent = visitLog.getUserAgent();
        this.visitedAt = visitLog.getVisitedAt();
    }
}
