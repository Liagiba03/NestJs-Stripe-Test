import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(
        envs.stripeSecret
    )

    async createPaymentSession( paymentSessionDto: PaymentSessionDto){

        // Se toman los datos
        const {currency, items} = paymentSessionDto;

        //Retorna el objeto que queremos crear para mandarlo
        const lineItems = items.map( item => {
            return {
                price_data: {
                    currency: currency,
                    product_data: {
                        name: item.name
                    },
                    unit_amount: Math.round( item.price * 100)   //Entero con decimales(centavos) Le quita los decimales y lo rendondea
                },
                quantity: item.quantity
            }
        })


        const session = await this.stripe.checkout.sessions.create({
            // Colocar el id de la orden 
            // Se coloca toda la informacion a enviar a stripe
            payment_intent_data: {
                metadata: {}
            },

            line_items: lineItems,
            mode:'payment', // Se puede cambiar por subscrption
            success_url: 'http://localhost:3003/payments/sucess',
            cancel_url: 'http://localhost:3003/payments/cancelled'
        });

        return session;
    }
}
