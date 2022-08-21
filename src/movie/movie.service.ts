import { Injectable, NotFoundException } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { Types } from 'mongoose'
import { TelegramService } from 'src/telegram/telegram.service'
import { MovieModel } from './movie.model'
import { UpdateMovieDto } from './updateMovie.dto'

@Injectable()
export class MovieService {
	constructor(
		@InjectModel(MovieModel) private readonly MovieModel: ModelType<MovieModel>,
		private readonly telegramService: TelegramService
	) {}
	async getAll(searchTerm?: string) {
		let options = {}

		if (searchTerm) {
			options = {
				$or: [
					{
						title: new RegExp(searchTerm, 'i'),
					},
				],
			}
		}

		return this.MovieModel.find(options)
			.select('-updatedAt -__v')
			.sort({
				createdAt: 'desc',
			})
			.populate('genres actors')
			.exec()
	}

	async getBySlug(slug: string) {
		const doc = await this.MovieModel.findOne({ slug })
			.populate('actors genres')
			.exec()
		if (!doc) throw new NotFoundException('Movie not found')

		return doc
	}

	async getByActor(actorId: Types.ObjectId) {
		const doc = await this.MovieModel.find({ actors: actorId }).exec()
		if (!doc) throw new NotFoundException('Movie not found')

		return doc
	}

	async getByGenres(genreIds: Types.ObjectId[]) {
		const docs = await this.MovieModel.find({
			genres: { $in: genreIds },
		}).exec()
		if (!docs) throw new NotFoundException('Genre not found')

		return docs
	}

	async getMostPopular() {
		return this.MovieModel.find({ countOpened: { $gt: 0 } })
			.sort({ countOpened: -1 })
			.populate('genres')
			.exec()
	}

	async updateCountOpened(slug: string) {
		const updateMovie = await this.MovieModel.findOneAndUpdate(
			{ slug },
			{
				$inc: { countOpened: 1 },
			}
		)

		if (!updateMovie) throw new NotFoundException('Movie not found')

		return updateMovie
	}

	async updateRating(id: Types.ObjectId, newRating: number) {
		return this.MovieModel.findByIdAndUpdate(
			id,
			{
				rating: newRating,
			},
			{
				new: true,
			}
		).exec()
	}

	// Admin Place
	async getOne(_id: string) {
		const movie = await this.MovieModel.findById(_id)
		if (!movie) throw new NotFoundException('Movie not found')

		return movie
	}

	async create() {
		const defaultValue: UpdateMovieDto = {
			poster: '',
			bigPoster: '',
			title: '',
			slug: '',
			videoUrl: '',
			actors: [],
			genres: [],
		}

		const movie = await this.MovieModel.create(defaultValue)
		return movie._id
	}

	async update(_id: string, dto: UpdateMovieDto) {
		if (!dto.isSendTelegram) {
			await this.sendNotification(dto)
			dto.isSendTelegram = true
		}
		const updateMovie = await this.MovieModel.findByIdAndUpdate(_id, dto, {
			new: true,
		})

		if (!updateMovie) throw new NotFoundException('Movie not found')

		return updateMovie
	}

	async delete(id: string) {
		const deleteMovie = await this.MovieModel.findByIdAndDelete(id)

		if (!deleteMovie) throw new NotFoundException('Movie not found')

		return deleteMovie
	}

	async sendNotification(dto: UpdateMovieDto) {
		if (process.env.NODE_ENV !== 'development') {
			await this.telegramService.sendPhoto(dto.poster)

			const msg = `<b>${dto.title}</b>`

			await this.telegramService.sendMessage(msg, {
				reply_markup: {
					inline_keyboard: [
						[
							{
								url: `http://movie_platform/movie/${dto.slug}`,
								text: '🍿 Go to watch',
							},
						],
					],
				},
			})
		}
	}
}
