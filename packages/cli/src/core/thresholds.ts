export interface Thresholds {
  denseServicesAvgOutbound: number;
  denseServicesCount: number;
  denseServicesLongestPath: number;
  sharedCandidateConsumers: number;
  stage1FileCount: number;
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  denseServicesAvgOutbound: 2,
  denseServicesCount: 6,
  denseServicesLongestPath: 4,
  sharedCandidateConsumers: 2,
  stage1FileCount: 8,
};
