import React, {useEffect} from 'react'
import {observer} from "mobx-react";
import {BungieData} from "../../helpers/data/BungieData";
import {Alert, AlertTitle, Paper} from "@mui/material";
import classes from './ShowCase.module.scss';

export const ShowCase = observer(function ShowCase() {

  const error = BungieData.error;
  const loading = BungieData.fetching;

  useEffect(() => {
    BungieData.populate()
      .catch(console.error);
  }, []);

  return (
    <Paper className={classes.root}>
      {/* fixme standardise error messages */}
      {error && (
        <Alert severity="error" className={classes.error}>
          <AlertTitle>Opps, something bad happened!</AlertTitle>
          {error.message}
        </Alert>
      )}

    </Paper>
  )
});

