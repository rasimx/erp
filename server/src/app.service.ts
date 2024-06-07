import { Injectable } from '@nestjs/common';
import { CookieJar } from 'tough-cookie';

interface SetResponse {
  payload: null | Record<string, any>;
  errors?: {
    code: string;
    message: string;
    detailMessage: string;
  }[];
  timestamp?: string;
  error?: string;

  // error?: 'Time slot cannot be reserved';
}
//
// const getNewClient = async (): Promise<Got> => {
//   const cookieJar = new CookieJar();
//
//   const response = gotScraping.post(
//     'https://api.business.kazanexpress.ru/api/oauth/token',
//     {
//       cookieJar,
//       headers: {
//         Authorization: `Basic ${btoa('kazanexpress:secretKey')}`,
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       resolveBodyOnly: true,
//       // proxyUrl: 'http://VUZhAt:yrdAk2GYq3yD@dproxy.site:12740',
//       proxyUrl: 'http://AfuG3E:PennuM5yf4cE@wproxy.site:10523',
//       body: 'grant_type=password&username=xuz.angelina%40gmail.com&password=Wxymh37_srDEYngP',
//     },
//   );
//
//   // const a = await response;
//
//   const body = await response.json<{
//     access_token: string;
//     token_type: string;
//     refresh_token: string;
//     expires_in: number;
//     scope: string;
//   }>();
//
//   if (!body) {
//     console.log('change IP');
//     const resp = await gotScraping<{ status: string }>(
//       'https://changeip.mobileproxy.space/?proxy_key=5628d170bbc02b57bd258cbf65f88031&format=json',
//       {
//         responseType: 'json',
//         resolveBodyOnly: true,
//       },
//     );
//     // {"status":"OK","code":200,"new_ip":"91.193.177.180","rt":"4.42","proxy_id":178410}
//     if (resp.status != 'OK') {
//       throw new Error('PROXY_ERROR');
//     }
//     return await getNewClient();
//   }
//
//   const options: OptionsInit = {
//     cookieJar,
//     headers: {
//       Authorization: `${body.token_type} ${body.access_token}`,
//     },
//   };
//
//   return gotScraping.extend(options);
// };

@Injectable()
export class AppService {
  // constructor(@InjectBot() private bot: Telegraf) {
  constructor() {
    // this.catchTimeslot();
    // this.catchTimeslot();
    // this.catchTimeslot();
    // this.catchTimeslot2();
    // this.b();
  }
  getHello(): string {
    return 'Hello World!';
  }
  //
  // async catchTimeslot() {
  //   interface GetTimeSlotResponse {
  //     payload: null | {
  //       timeSlots: { timeFrom: number; timeTo: number }[];
  //     };
  //     errors?: { code: string; message: string }[];
  //     error?: string;
  //   }
  //
  //   const invoiceIds = [3854768, 3854733];
  //
  //   let client = await getNewClient();
  //
  //   foo: while (true) {
  //     const response = await client.post<GetTimeSlotResponse>({
  //       url: 'https://api.business.kazanexpress.ru/api/seller/shop/43610/v2/invoice/time-slot/get',
  //       method: 'POST',
  //       json: {
  //         invoiceIds,
  //         timeFrom: +moment().tz('Europe/Moscow').add(2, 'day').startOf('day'),
  //       },
  //       responseType: 'json',
  //       resolveBodyOnly: true,
  //     });
  //
  //     try {
  //       if (
  //         response?.error == 'Unauthorized' ||
  //         /<!DOCTYPE html>/.test(response as unknown as string)
  //       ) {
  //         console.log('Unauthorized or error');
  //         client = await getNewClient();
  //         continue;
  //       }
  //       if (response.payload?.timeSlots.length) {
  //         // if (true) {
  //         const timeSlots = response.payload.timeSlots;
  //         // const timeSlots = [
  //         //   { timeFrom: 1697317200000, timeTo: 1692651600000 },
  //         // ];
  //
  //         console.log('timeSlots:', JSON.stringify(timeSlots));
  //
  //         const setResponses = (
  //           await Promise.all(
  //             timeSlots.map((timeSlot) =>
  //               Promise.all(
  //                 [...Array(5)].map(() =>
  //                   this.set(client, invoiceIds, timeSlot.timeFrom),
  //                 ),
  //               ),
  //             ),
  //           )
  //         ).flatMap((item) => item);
  //
  //         if (setResponses.find((item) => !item.error)) {
  //           console.log('FINISH');
  //           break;
  //         }
  //       } else {
  //         console.log('empty', Date.now(), response);
  //       }
  //       await new Promise((resolve) => setTimeout(resolve, 400));
  //     } catch (e) {
  //       // await this.bot.telegram.sendMessage('438088614', 'ERROR');
  //       console.log('QQQ', e, response);
  //       await new Promise((resolve) => setTimeout(resolve, 500));
  //       if (e.message == 'PROXY_ERROR') break;
  //     }
  //   }
  // }
  //
  // async catchTimeslot2() {
  //   const invoiceIds = [3854768, 3854733];
  //
  //   const client = await getNewClient();
  //   const dates = [
  //     // '2023-10-23',
  //     // '2023-10-24',
  //     // '2023-10-25',
  //     // '2023-10-26',
  //     // '2023-10-27',
  //     // '2023-10-28',
  //     '2023-10-29',
  //     '2023-10-30',
  //   ];
  //
  //   const times = dates.map((date) =>
  //     moment.tz(date, 'Europe/Moscow').valueOf(),
  //   );
  //
  //   while (true) {
  //     const setResponses = (
  //       await Promise.all(
  //         times.map((timeFrom) => this.set(client, invoiceIds, timeFrom)),
  //       )
  //     ).flatMap((item) => item);
  //
  //     if (setResponses.find((item) => !!item.payload)) {
  //       console.log('FINISH');
  //       break;
  //     }
  //     await new Promise((resolve) => setTimeout(resolve, 500));
  //   }
  // }
  //
  // async set(client: Got, invoiceIds, timeFrom: number): Promise<SetResponse> {
  //   try {
  //     const response = await client.post<SetResponse>({
  //       url: 'https://api.business.kazanexpress.ru/api/seller/shop/66186/v2/invoice/time-slot/set',
  //       json: {
  //         invoiceIds,
  //         timeFrom,
  //       },
  //       responseType: 'json',
  //       resolveBodyOnly: true,
  //     });
  //     if (
  //       /<!DOCTYPE html>/.test(response as unknown as string) ||
  //       /503/.test(response as unknown as string)
  //     ) {
  //       console.log('SET', '<!DOCTYPE html>');
  //       return { payload: null, error: '<!DOCTYPE html>' };
  //     } else {
  //       console.log('SET', response);
  //       return response;
  //     }
  //   } catch (e) {
  //     console.log('BBB', e);
  //     return { payload: null, error: e.message };
  //   }
  // }
}
