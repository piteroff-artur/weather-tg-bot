import {Telegraf} from 'telegraf';
import dotenv from 'dotenv';
import request from 'request';

dotenv.config()
const bot = new Telegraf(process.env.BOT_TOKEN);

const logging = ctx => {
    console.log(`Sent reply of "${ctx.message.text}" to ${ctx.message.from.username}`)
}

bot.start(ctx => ctx.reply("Hello! I am a Weather Bot.").then(() => logging(ctx)));
bot.help(ctx => ctx.reply("/start - Start the bot.\n" +
    "/help - This help.\n" +
    "/weather {CITY or CITY&PARAMS(beta)} - Get weather").then(() => logging(ctx)));

bot.command('weather', ctx => {
    const city = ctx.message.text.split(' ')[1];
    if (city === undefined) {
        ctx.reply('Oops! You forgot to enter the name of the city!').then(() => logging(ctx));
        return;
    }
    const weatherUrl =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHERAPP_TOKEN}&units=metric`;
    request(weatherUrl, (err, res, body) => {
        const result = JSON.parse(body);
        const resultCode = +result['cod'];
        if (resultCode === 401) {
            ctx.reply(`My API token not work, or you sent argument with "&appid=..." Please send me report to email piteroff.artur@gmail.com`)
                .then(() => logging(ctx));
            return;
        } else if (resultCode >= 400 && resultCode < 500) {
            ctx.reply(`Error: City "${city}" not found.`)
                .then(() => logging(ctx));
            return;
        }
        ctx.reply(`Weather in ${result.name}:\n${result['weather'][0]['main']}, ${result['main']['temp'].toFixed(0)}°C`)
            .then(() => logging(ctx));
    });
});

bot.on('message', ctx => {
    ctx.reply(`You said: ${ctx.message.text}`).then(() => logging(ctx));
});

bot.launch()
    .then(() => console.log("Bot Started"))
    .catch(err => console.log(err));