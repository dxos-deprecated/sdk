//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import { createKeyPair, keyToString } from '@dxos/crypto';

import { useAssets } from '../src/components';

export default {
  title: 'Parties'
};

const useStyles = makeStyles(theme => ({
  card: {
    width: 300
  }
}));

export const withCard = () => {
  const classes = useStyles();
  const assets = useAssets();
  const topic = keyToString(createKeyPair().publicKey);

  // TODO(burdon): Replace with party card.
  return (
    <Box m={2}>
      <Card className={classes.card}>
        <CardActionArea>
          <CardMedia
            component='img'
            height={100}
            image={assets.getThumbnail(topic)}
          />

          <CardContent>
            <Typography variant='h5' gutterBottom>My Card</Typography>
            <Typography variant='body2' color='textSecondary'>This is a card.</Typography>
          </CardContent>
        </CardActionArea>

        <CardActions>
          <Button size='small' color='primary'>Open</Button>
        </CardActions>
      </Card>
    </Box>
  );
};
