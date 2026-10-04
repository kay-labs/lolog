package com.lolog.repository;

import com.lolog.domain.VisitLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VisitLogRepository extends JpaRepository<VisitLog, Long> {
    Page<VisitLog> findAllByOrderByVisitedAtDesc(Pageable pageable);
}
