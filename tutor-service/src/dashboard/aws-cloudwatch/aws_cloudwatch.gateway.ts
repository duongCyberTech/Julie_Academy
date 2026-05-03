import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CloudWatchClient, GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import { ConfigService } from "@nestjs/config/dist/config.service";
import { ApiMetricsService } from "../metrics/api-metrics.service";

@WebSocketGateway({ 
  cors: { origin: '*' }
})
export class AwsCloudWatchGateway {
  @WebSocketServer()
  server!: Server;

  private cloudWatchClient!: CloudWatchClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly apiMetrics: ApiMetricsService
  ) {
    this.cloudWatchClient = new CloudWatchClient({ 
      region: this.configService.get('AWS_REGION') || "",
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || "",
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || "",
      },
    });
  }

  private async fetchEC2Metrics() {
    const command = new GetMetricDataCommand({
      MetricDataQueries: [
        {
          Id: 'cpuUtilization',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'CPUUtilization',
              Dimensions: [
                {
                  Name: 'InstanceId',
                  Value: this.configService.get('AWS_EC2_INSTANCE_ID') || "" // Thay bằng InstanceId thực tế
                }
              ]
            },
            Period: 60,
            Stat: 'Average',
          },
          ReturnData: true,
        },
        {
          Id: 'networkIn',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'NetworkIn',
              Dimensions: [
                {
                  Name: 'InstanceId',
                  Value: this.configService.get('AWS_EC2_INSTANCE_ID') || "" // Thay bằng InstanceId thực tế
                }
              ]
            },
            Period: 60,
            Stat: 'Average',
          },
          ReturnData: true,
        },
        {
          Id: 'networkOut',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'NetworkOut',
              Dimensions: [
                {
                  Name: 'InstanceId',
                  Value: this.configService.get('AWS_EC2_INSTANCE_ID') || "" // Thay bằng InstanceId thực tế
                }
              ]
            },
            Period: 60,
            Stat: 'Average',
          },
          ReturnData: true,
        },
      ],
      StartTime: new Date(Date.now() - 5 * 60 * 1000), // Lấy dữ liệu trong 5 phút gần nhất
      EndTime: new Date(),
    });
    return await this.cloudWatchClient.send(command);
  }

  @SubscribeMessage('get_ec2_metrics')
  async handleGetEC2Metrics(client: Socket) {
    try {
      const metricsData = await this.fetchEC2Metrics();
      const apiData = this.apiMetrics.getAndResetMetrics();
      metricsData.MetricDataResults?.push({
        Id: 'apiMetrics',
        Label: 'API Metrics',
        Timestamps: [new Date()],
        Values: [apiData.total, apiData.success, apiData.error, apiData.avg_duration],
      })
      console.log("Dữ liệu CloudWatch đã được gửi");
      client.emit('ec2_metrics', metricsData);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu CloudWatch:", error);
      client.emit('ec2_metrics_error', 'Không thể lấy dữ liệu CloudWatch');
    }
  }
}