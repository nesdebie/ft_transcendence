all: build up

build:
	docker-compose --file ./docker-compose.yml build

up:
	docker-compose --file ./docker-compose.yml up 

detach:
	docker-compose --file ./docker-compose.yml up --detach --build

down:
	docker compose --file ./docker-compose.yml down

fclean: down
	docker volume rm $$(docker volume ls -q)
	docker builder prune --all --force

re: fclean all

rd: fclean detach

du: down up

dd: down detach

.PHONY: all detach up down fclean re rd dd du