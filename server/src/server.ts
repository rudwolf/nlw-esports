import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { ConvertHourToMinutes } from './util/convert-hour-to-minutes';
import { ConvertMinutesToHours } from './util/convert-minutes-to-hours';

const app = express();

app.use(express.json())
app.use(cors())

const prisma = new PrismaClient({
  log: ['query']
});

// get list of all available games
app.get('/games', async (request, response) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true
        }
      }
    }
  })

  return response.json(games)
});

// get ads
app.get('/games/:id/ads', async (request, response) => {
  const gameId = request.params.id;

  const ads : any = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      yearsPlaying: true,
      useVoiceChannel: true,
      hourStart: true,
      hourEnd: true,
    },
    where: {
      gameId,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return response.json(ads.map((ad: { weekDays: string; hourStart: number; hourEnd: number; }) => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hourStart: ConvertMinutesToHours(ad.hourStart),
      hourEnd: ConvertMinutesToHours(ad.hourEnd),
    }
  }));
});

// get discord from user ad
app.get('/ads/:id/discord', async (request, response) => {
  const adId = request.params.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: {
      id: adId,
    }
  })

  return response.json(ad)
});

// creates a new ad
app.post('/games/:id/ads', async (request, response) => {
  const gameId = request.params.id;
  const body = request.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(','),
      hourStart: ConvertHourToMinutes(body.hourStart),
      hourEnd: ConvertHourToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel
    }
  })

  return response.status(201).json(ad)
});

app.listen(3333);
