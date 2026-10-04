package com.lolog.controller;

import com.lolog.dto.visitlog.VisitLogResponse;
import com.lolog.service.VisitLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final VisitLogService visitLogService;

    @GetMapping("/visit-logs")
    public ResponseEntity<Page<VisitLogResponse>> getVisitLogs(
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(visitLogService.getLogs(pageable));
    }
}
