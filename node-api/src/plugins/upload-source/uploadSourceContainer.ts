import { Container } from 'inversify';
import { model } from 'mongoose';

const container = new Container();

// We're using sync-source's models and don't need additional models
// Container is set up for future use if needed

export const uploadSourceContainer = container;