import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

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


    async stripeWebhook( req: Request, res: Response){
        const sig = req.headers['stripe-signature'];
        //console.log({sig})
        let event: Stripe.Event;
        //Testing on localhost
        //const endpointSecret = 'whsec_2a0627840798e59d97ddccaddb6899bd276b6162ba0b981459aadb19e4dbbaa7';

        //Real
        const endpointSecret = 'whsec_1qk7V92briJev3A2nGRfgN2Nboy73x2I';

        try {
            event = this.stripe.webhooks.constructEvent(
                req['rawBody'], 
                sig, 
                endpointSecret,
            );
        } catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
            return ;
        }

        console.log({event});

        switch(event.type){
            case 'charge.succeeded':
                // TODO: Call our service
                console.log(event);
            break;

            default:
                console.log(`Evento ${ event.type} not handled`);

        }
        return res.status(200).json({sig});
    }
}
