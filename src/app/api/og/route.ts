// app/api/og/route.ts
import { createCanvas, loadImage } from 'canvas';
import AWS from 'aws-sdk';
import { NextResponse } from 'next/server';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: 'ap-south-1',
});

export async function POST(req: Request) {
  try {
    const { username, profile_image } = await req.json();
    const width = 1200;
    const height = 627;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const bg = await loadImage(
      'https://res.cloudinary.com/djocenrah/image/upload/v1740234119/og_profile_s4prh0.png'
    );
    ctx.drawImage(bg, 0, 0, width, height);

    const avatar = await loadImage(profile_image);
    const centerX = 265;
    const centerY = 315;
    const radius = 165;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      avatar,
      centerX - radius,
      centerY - radius,
      radius * 2,
      radius * 2
    );
    ctx.restore();

    ctx.font = '35px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(username, 357, 590.5);

    const buffer = canvas.toBuffer('image/png');
    const key = `og_images/${username}.png`;

    const exists = await s3
      .headObject({ Bucket: 'goformeet', Key: key })
      .promise()
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      await s3
        .upload({
          Bucket: 'goformeet',
          Key: key,
          Body: buffer,
          ContentType: 'image/png',
          ACL: 'public-read',
        })
        .promise();
    }

    const url = `https://goformeet.s3.ap-south-1.amazonaws.com/${key}`;
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'OG generation failed' }, { status: 500 });
  }
}
