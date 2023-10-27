


<!-- 1. install all dependencies by running `yarn` -->
<!-- 2. build `yarn build && yarn bootstrap` -->
3. `cp skandha/config.json.default skandha/config.json`
4. edit `config.json`
5. `docker build -t etherspot/skandha ./skandha`
6. `docker run --mount type=bind,source="$(pwd)"/config.json,target=/usr/app/config.json,readonly -dp 14337:14337 etherspot/skandha standalone`
7. Skandha will run for all chains available in `config.json`
8. Networks will be available at `http://localhost:14337/{chainId}/` (e.g. for dev `http://localhost:14337/1337/`)