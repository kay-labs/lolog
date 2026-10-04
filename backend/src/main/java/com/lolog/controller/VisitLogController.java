package com.lolog.controller;

import com.lolog.dto.visitlog.VisitLogRequest;
import com.lolog.service.VisitLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 프론트에서 페이지가 바뀔 때마다 한 번 호출해 방문 로그를 남긴다.
 * (API 호출마다 기록하면 화면 하나에 로그가 여러 줄 쌓이므로 페이지 이동 기준으로 기록)
 */
@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
public class VisitLogController {

    private final VisitLogService visitLogService;

    @PostMapping
    public ResponseEntity<Void> record(@RequestBody VisitLogRequest request,
                                       HttpServletRequest httpRequest,
                                       Authentication authentication) {
        // 로그인한 관리자의 방문은 기록하지 않는다. (비로그인 사용자는 authentication이 null)
        if (authentication == null) {
            visitLogService.record(getClientIp(httpRequest), request.getPath(), httpRequest.getHeader("User-Agent"));
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * 서버가 Nginx 같은 프록시 뒤에 있으면 getRemoteAddr()는 프록시 IP를 반환하므로,
     * 원래 클라이언트 IP가 담긴 X-Forwarded-For 헤더의 맨 앞 값을 우선 사용한다.
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
