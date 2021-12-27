import * as React from 'react'
import {useEffect, useState} from 'react'
import Button from '@mui/material/Button';
import {beginAuthProcess, finishAuthProcess} from "./auth-logic";
import {Alert, AlertTitle, Link, Paper, Typography} from "@mui/material";
import {BungieRequests} from "../../helpers/comms";
import {observer} from "mobx-react";
import {Loading} from "../atoms/Loading/Loading";
import classes from './Auth.module.scss';
import {BungieData} from "../../helpers/data/BungieData";
import Twitter from "@mui/icons-material/Twitter";

export const Auth = observer(function Auth() {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.toString());

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (code && state) {
      setLoading(true);
      finishAuthProcess(code, state)
        .then((data) => {
          BungieRequests.setUserAuth(data);
          window.close();
        })
        .catch(setError);
    }
  }, [window.location.search, setError]);


  return (
    <Paper className={classes.root}>

      {/* fixme standardise error messages */}
      {error && (
        <Alert severity="error" className={classes.error}>
          <AlertTitle>Oops, looks like something went wrong!</AlertTitle>
          {error.message}
        </Alert>
      )}

      {/* fixme standardise error messages */}
      {BungieData.error && (
        <Alert severity="error" className={classes.error}>
          <AlertTitle>Oops, looks like we can't connect to Bungie.net!</AlertTitle>
          Please make sure you are online and check their <Link href="https://twitter.com/BungieHelp"
                                                                target="_blank">Twitter <Twitter/></Link> for
          maintenance notices<br/>
          {BungieData.error.message}
        </Alert>
      )}

      {!loading && (
        <>
          <Typography variant="h3">D2 Weapons breakdown</Typography>
          <Typography variant="h6">Login to get a breakdown for all your weapons</Typography>
          <Typography variant="h6">Helps you decide which to keep and which to dismantle</Typography>

          <Button
            className={classes.login}
            size="large"
            variant="contained"
            onClick={() => {
              beginAuthProcess().catch(console.error)
              setLoading(true)
            }}
          >
            Login
          </Button>
        </>
      )}


      {loading && (
        <Loading/>
      )}
    </Paper>
  );
});
