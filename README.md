# [Field Mapper](https://fieldmapper.vercel.app/)

I developed Field Mapper while interning at the San Francisco Department of Technology under the SFGIS team. The motivation for the project arose from rising SAAS costs and a desire to have a streamlined workflow for mobile data collection, which is performed routinely across City Departments for various purposes. After speaking to a few teams interested in adopting an in-house alternative, we focused our efforts on providing 1) an easy-to-use survey building wizard, 2) a (mobile) responsive mapping interface with routing capabilities and custom high-res basemaps, and 3) sufficient admin priviliges to accomodate the hierarchy and volatility of field mapping teams.

Using this project as an opportunity to try out bleeding edge practices, I decided to build Field Mapper using [Remix]([url](https://remix.run/docs/en/1.16.0)), an SSR React framework. I challenged myself to adhere to Remix's conventions, which led me to leverage [Prisma]([url](https://www.prisma.io/docs)) as an ORM. Field Mapper's map viewer and directions routing is powered by Mapbox GL JS, through a [React-friendly API]([url](https://visgl.github.io/react-map-gl/)) by vis.gl. Also from this group are [the data loaders]([url](https://loaders.gl/docs/specifications/category-gis)) I leverage to convert the geospatial data input by users into GeoJSONs for ease of storage and manipulation. For survey building and completion, I embedded [SurveyJS]([url](https://surveyjs.io/dashboard?gad=1))'s full-featured interfaces. (Upgrading our SurveyJS instance to use their Survey Creator wizard has been the only expense of this project.) Because image uploading is so important to city inspections, I use an Amazon S3 Bucket to easily store and access images (as urls) that are uploaded from a survey. Finally, I have deployed Field Mapper using [Vercel]([url](https://vercel.com/)), which works nicely with Remix apps.

In January 2023, Field Mapper was tested by an individual interested in retiring her clunky field mapping workflow. This user study was a confidence booster as Field Mapper  performed as intended despite the user's complex use case. Due to unforeseen circumstances, however, we were forced to end the user study and the development of Field Mapper altogether. Thus, while I will no longer be maintaining this repository, I'd be thrilled to share it with those who are interested and might find my implementation useful. Please don't hesitate to reach out!

## Demo

[![Field Mapper Demo](https://cdn.loom.com/sessions/thumbnails/bcee14de4c40458dad56f4d813dbbb0e-with-play.gif)](https://www.loom.com/share/bcee14de4c40458dad56f4d813dbbb0e "Field Mapper Demo")

## Development

Install yarn:

```sh
npm install -g yarn
yarn set version berry
```

Start the app in development mode, rebuilding assets on file changes:

```sh
yarn run dev
```

## Deployment

First, build app for production:

```sh
yarn run build
```

Then run the app in production mode:

```sh
yarn start
```
