import { Test, TestingModule } from '@nestjs/testing';
import { ReeService } from './ree.service';

describe('ReeService', () => {
  let service: ReeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReeService],
    }).compile();

    service = module.get<ReeService>(ReeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('flattenResponse', () => {
    it('should flatten REE API response structure', () => {
      const response = {
        data: {},
        included: [
          {
            type: 'Renovable',
            id: 'Renovable',
            attributes: {
              title: 'Renovable',
              content: [
                {
                  type: 'Eólica',
                  attributes: {
                    title: 'Eólica',
                    color: '#6fb114',
                    values: [
                      {
                        value: 100,
                        percentage: 0.5,
                        datetime: '2024-01-01T00:00:00.000+01:00',
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      };

      const result = (service as any).flattenResponse(response);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        datetime: new Date('2024-01-01T00:00:00.000+01:00'),
        category: 'Renovable',
        type: 'Eólica',
        value: 100,
        percentage: 0.5,
        color: '#6fb114',
      });
    });

    it('should return empty array for empty included', () => {
      const result = (service as any).flattenResponse({ data: {}, included: [] });
      expect(result).toEqual([]);
    });
  });
});
