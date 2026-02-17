package at.mymove.company.api.dto;

public record CompanyStatsResponse(
        long pendingCount,
        long approvedCount,
        long rejectedCount,
        long totalCount
) {}
