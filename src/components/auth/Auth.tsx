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
import {useSnackbar} from "notistack";

export const Auth = observer(function Auth() {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const {enqueueSnackbar} = useSnackbar();

  useEffect(() => {
    const url = new URL(window.location.toString());

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (code && state) {
      setLoading(true);
      enqueueSnackbar('Logging in', {variant: 'info'})
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
              enqueueSnackbar('Redirecting to Bungie.net', {variant: 'info'})
              beginAuthProcess()
                .then(() => {
                  enqueueSnackbar('Successfully logged in', {variant: 'info'})
                })
                .catch(e => {
                  enqueueSnackbar('Oops, something went wrong', {variant: 'error'});
                  enqueueSnackbar(e.message, {variant: 'error'});
                  console.error(e);
                })
              setLoading(true)
            }}
          >
            Login
          </Button>

          <Paper elevation={2} className={classes.info}>
            <Typography variant="h6" marginBottom="16px">
              This tool allows you to easily view your different weapon types from your inventory and vault.
            </Typography>

            <Typography>
              You have to log in to enable this tool to grab your weapons from the API.
            </Typography>

            <Typography>
              If you found a bug or have a feature request, please open an issue in the <a
              href="https://github.com/legraphista/d2-weapons-breakdown">Github Repository</a>!
            </Typography>

            <Typography>
              You can also find me on twitter{' '}
              <a href="https://twitter.com/legraphista">
                <Twitter fontSize="inherit"/> @legraphista
              </a>
            </Typography>

            <Typography style={{marginTop: 16}}>
              <b>D2 Weapons breakdown</b> uses the Bungie.net api and it's OAuth authorization.
            </Typography>
            <Typography>
              You log in on an official Bungie.net page and <b>D2 Weapons breakdown</b> receives a temporary login token
              from Bungie.
            </Typography>
            <Typography>
              That means it does not receive your credentials.
            </Typography>
          </Paper>
        </>
      )}

      {loading && (
        <Loading/>
      )}
    </Paper>
  );
});
