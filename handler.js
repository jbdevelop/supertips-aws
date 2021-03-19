'use strict'

const mongoose = require('mongoose')
const { Schema } = mongoose

module.exports.connect = async () => {
  const uri = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}?${process.env.DATABASE_URL_PARAMS}`

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}

module.exports.Model = () => {
  const schema = new Schema({ url: String, tags: Array }, { timestamps: true })
  return mongoose.models.Tip || mongoose.model('Tip', schema)
}

module.exports.create = async event => {
  try {
    await this.connect()

    const TipModel = this.Model()

    const bodyParams = JSON.parse(event.body)

    const data = new TipModel(bodyParams)

    const doc = await data.save()

    return {
      statusCode: 201,
      body: JSON.stringify(doc),
    }
  } catch (error) {
    console.error(error)
  }
}

module.exports.list = async event => {
  try {
    await this.connect()

    const TipModel = this.Model()

    const collection = await TipModel.find()

    return {
      statusCode: 200,
      body: JSON.stringify(collection),
    }
  } catch (error) {
    console.error(error)
  }
}

module.exports.listByTags = async event => {
  await this.connect()

  const TipModel = this.Model()

  const { tags } = event.pathParameters

  const tagsArray = tags.split(',')

  const tips = await TipModel.find({ tags: { $in: tagsArray } })

  const tipsFiltered = tips.filter(tip =>
    tagsArray.every(tagArray => tip.tags.includes(tagArray))
  )

  return {
    statusCode: 200,
    body: JSON.stringify(tipsFiltered),
  }
}
