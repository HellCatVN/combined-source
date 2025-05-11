import dotenv from 'dotenv';
dotenv.config();
const { TOKEN_LIFE, TOKEN_SECRET, REFRESH_TOKEN_LIFE, REFRESH_TOKEN_SECRET } = process.env;

export const getTokenLife = () => {
    if (!TOKEN_LIFE) {
        throw Error('Token Life not found!');
    }
    return TOKEN_LIFE;
};

export const getTokenSecret = () => {
    if (!TOKEN_SECRET) {
        throw Error('Token Secret not found!');
    }
    return TOKEN_SECRET;
};

export const getRefreshTokenLife = () => {
    if (!REFRESH_TOKEN_LIFE) {
        throw Error('Refresh Token Life not found!');
    }
    return REFRESH_TOKEN_LIFE;
};

export const getRefreshTokenSecret = () => {
    if (!REFRESH_TOKEN_SECRET) {
        throw Error('Refresh Token Secret not found!');
    }
    return REFRESH_TOKEN_SECRET;
};

export const configHash = {
    saltRounds: 10,
    verifyTokenLength: 16,
    tokenExpireTime: getTokenLife(),
    forgotPwTokenLength: 16,
    forgotPwExpireTime: 15 * 60 * 1000,
};
