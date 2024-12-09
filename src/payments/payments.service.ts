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
        const {currency, items, orderId} = paymentSessionDto;

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
                metadata: {
                    orderId : orderId
                }
            },

            line_items: lineItems,
            mode:'payment', // Se puede cambiar por subscrption
            success_url: envs.stripeSuccessUrl,
            cancel_url: envs.stripeCancelUrl
        });

        return session;
    }


    async stripeWebhook( req: Request, res: Response){
        const sig = req.headers['stripe-signature'];
        //console.log({sig})
        let event: Stripe.Event;
     
        //Real
        const endpointSecret = envs.stripeEndpointSecret;

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

        //console.log({event});

        switch(event.type){
            case 'charge.succeeded':

            const chargeSucceeded = event.data.object;
                // TODO: Call our service
                console.log('WEBHOOK')
                console.log({
                    metadata: chargeSucceeded.metadata,
                    orderId : chargeSucceeded.metadata.orderId

                })
                //console.log(event);
            break;

            default:
                console.log(`Evento ${ event.type} not handled`);

        }
        return res.status(200).json({sig});
    }
}
