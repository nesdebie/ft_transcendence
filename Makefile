all: up

up:
	docker-compose --file ./docker-compose.yml up --build

detach:
	docker-compose --file ./docker-compose.yml up --detach --build

down:
	docker compose --file ./docker-compose.yml down

clean: down
	docker volume rm $$(docker volume ls -q)
	docker builder prune --all --force

re: clean all

redetach: clean detach

.PHONY: all detach up down clean re redetach