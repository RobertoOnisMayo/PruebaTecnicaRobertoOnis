import { Injectable, Logger } from '@nestjs/common';

const REE_API_BASE = 'https://apidatos.ree.es/es/datos/balance/balance-electrico';

export interface ReeValue {
  value: number;
  percentage: number;
  datetime: string;
}

export interface ReeContentItem {
  type: string;
  id: string;
  groupId: string;
  attributes: {
    title: string;
    color?: string;
    values: ReeValue[];
  };
}

export interface ReeIncludedItem {
  type: string;
  id: string;
  attributes: {
    title: string;
    content?: ReeContentItem[];
  };
}

export interface ReeApiResponse {
  data: unknown;
  included: ReeIncludedItem[];
}

export interface FlattenedBalanceRecord {
  datetime: Date;
  category: string;
  type: string;
  value: number;
  percentage: number | null;
  color: string | null;
}

@Injectable()
export class ReeService {
  private readonly logger = new Logger(ReeService.name);

  async fetchBalanceData(
    startDate: string,
    endDate: string,
    timeTrunc: string = 'day',
  ): Promise<FlattenedBalanceRecord[]> {
    const url = `${REE_API_BASE}?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}&time_trunc=${timeTrunc}`;
    this.logger.log(`Fetching REE data: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `REE API error: ${response.status} ${response.statusText}`,
      );
    }

    const json: ReeApiResponse = await response.json();
    return this.flattenResponse(json);
  }

  private flattenResponse(response: ReeApiResponse): FlattenedBalanceRecord[] {
    const records: FlattenedBalanceRecord[] = [];

    for (const included of response.included || []) {
      const category = included.attributes?.title || included.type || included.id;
      const content = included.attributes?.content || [];

      for (const item of content) {
        if (!item.attributes?.values) continue;

        const type = item.attributes.title || item.type;
        const color = item.attributes.color || null;

        for (const v of item.attributes.values) {
          records.push({
            datetime: new Date(v.datetime),
            category,
            type,
            value: v.value,
            percentage: v.percentage ?? null,
            color,
          });
        }
      }
    }

    return records;
  }
}
