all: build up

build:
	docker compose --file ./docker-compose.yml build

up:
	docker compose --file ./docker-compose.yml up 

detach:
	docker compose --file ./docker-compose.yml up --detach

down:
	docker compose --file ./docker-compose.yml down --volumes

fclean: down
	docker image prune --all --force
	docker builder prune --all --force
	rm -f ./Django/certificate.crt
	rm -f ./Django/private.key

re: fclean all

rd: fclean detach

du: down up

dd: down detach

.PHONY: all detach up down fclean re rd dd du