export const DEFAULT_THRESHOLDS = {
  denseServicesAvgOutbound: 2,
  denseServicesCount: 6,
  denseServicesLongestPath: 4,
  sharedCandidateConsumers: 2,
  stage1FileCount: 8,
} as const;

export type Thresholds = typeof DEFAULT_THRESHOLDS;
