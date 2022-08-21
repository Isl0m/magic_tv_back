import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { IdValidationPipe } from 'src/user/pipes/id.validation.pipe'
import { ActorDto } from './actor.dto'
import { ActorService } from './actor.service'

@Controller('actor')
export class ActorController {
	constructor(private readonly actorService: ActorService) {}

	@Get('by-slug/:slug')
	async getBySlug(@Param('slug') slug: string) {
		return this.actorService.getBySlug(slug)
	}

	@Get()
	async getAll(@Query('searchTerm') searchTerm?: string) {
		return this.actorService.getAll(searchTerm)
	}

	@Get(':id')
	@Auth('admin')
	async getOne(@Param('id', IdValidationPipe) id: string) {
		return this.actorService.getOne(id)
	}

	@UsePipes(new ValidationPipe())
	@Post()
	@HttpCode(200)
	@Auth('admin')
	async create() {
		return this.actorService.create()
	}

	@UsePipes(new ValidationPipe())
	@Put(':id')
	@HttpCode(200)
	@Auth('admin')
	async update(
		@Param('id', IdValidationPipe) id: string,
		@Body() dto: ActorDto
	) {
		return this.actorService.update(id, dto)
	}

	@Delete(':id')
	@HttpCode(200)
	@Auth('admin')
	async delete(@Param('id') id: string) {
		return this.actorService.delete(id)
	}
}
