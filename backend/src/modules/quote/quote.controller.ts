import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { GetQuoteDto } from './dto/get-quote.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('quote')
@UseGuards(ApiKeyGuard)
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Get()
  async getQuote(@Query() query: GetQuoteDto) {
    return this.quoteService.generateQuote(query);
  }
}
