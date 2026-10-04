package com.lolog.service;

import com.lolog.domain.VisitLog;
import com.lolog.dto.visitlog.VisitLogResponse;
import com.lolog.repository.VisitLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VisitLogService {

    private final VisitLogRepository visitLogRepository;

    public Page<VisitLogResponse> getLogs(Pageable pageable) {
        return visitLogRepository.findAllByOrderByVisitedAtDesc(pageable).map(VisitLogResponse::new);
    }

    @Transactional
    public void record(String ip, String path, String userAgent) {
        visitLogRepository.save(VisitLog.builder()
                .ip(ip)
                .path(truncate(path))
                .userAgent(truncate(userAgent))
                .build());
    }

    // 컬럼 기본 길이(VARCHAR 255)를 넘으면 저장이 실패하므로 잘라서 저장한다.
    private String truncate(String value) {
        if (value == null) return null;
        return value.length() > 255 ? value.substring(0, 255) : value;
    }
}
