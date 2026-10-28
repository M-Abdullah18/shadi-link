import { HealthCheckResponse, HealthCheckResponseSchema } from '../types';

export interface HealthCheckResult {
  data: HealthCheckResponse | null;
  latencyMs: number;
  error?: string;
}

export async function fetchHealthCheck(): Promise<HealthCheckResult> {
  const startTime = performance.now();
  try {
    const response = await fetch('/api/health', {
      headers: {
        'Accept': 'application/json',
      },
    });

    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    const validatedData = HealthCheckResponseSchema.parse(json);

    return {
      data: validatedData,
      latencyMs,
    };
  } catch (err: any) {
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);
    return {
      data: null,
      latencyMs,
      error: err instanceof Error ? err.message : 'Unknown network error',
    };
  }
}
