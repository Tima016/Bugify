import { Module, Global } from '@nestjs/common';
import { ElasticsearchModule as NestElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { SearchService } from './search.service';

@Global()
@Module({
    imports: [
        NestElasticsearchModule.registerAsync({
            useFactory: (configService: ConfigService) => ({
                node: configService.get('ELASTICSEARCH_NODE') || 'http://localhost:9200',
                auth: {
                    username: configService.get('ELASTICSEARCH_USERNAME') || 'elastic',
                    password: configService.get('ELASTICSEARCH_PASSWORD') || 'changeme',
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [SearchService],
    exports: [SearchService, NestElasticsearchModule],
})
export class SearchModule { }
