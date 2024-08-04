all: up

up:
	docker-compose --file ./docker-compose.yml up --build

detach:
	docker-compose --file ./docker-compose.yml up --detach --build

down:
	docker compose --file ./docker-compose.yml down --volumes

fclean: down
	docker image prune --all --force
	docker builder prune --all --force

re: fclean all

rd: fclean detach

du: down up

dd: down detach

.PHONY: all detach up down fclean re rd dd du