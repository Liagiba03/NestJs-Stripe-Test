import { Body, Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

@Post('create-payment-session')
//Recibe los datos para enviarlos, con los datos del dto
createPaymentSession(@Body() paymentSessionDto: PaymentSessionDto){
  //Da como argumento los datos que se reciben en paymentSessionDto
  return this.paymentsService.createPaymentSession(paymentSessionDto);
  //return paymentSessionDto;
}

@Get('sucess')
success(){
  return {
    ok: true,
  message: 'Payment successfully'
  }
}

@Get('cancelled')
cancel(){
  return {
    ok: false,
  message: 'Payment cancelled'
  }
}

@Post('webhook')
async stripeEWebhook(){
  return 'stripeWebhook';
}
}
