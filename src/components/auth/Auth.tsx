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

          <div className={classes.qan}>
            <section>
              <Typography variant="h6">Q: Why do I need to login?</Typography>
              <Typography variant="body1">
                In Destiny 2, all the vendors inventory (except for Xûr) are tied to your character progression.<br/>
                In order to get the Gear/Armor, we have to ask for all vendors data <br/>
                even though the armor stock is the same for everyone.
              </Typography>
            </section>

            <section>
              <Typography variant="h6">Q: What data are you requesting?</Typography>
              <Typography variant="body1">
                We request data about your characters, <br/>
                and then use that to request vendor items being sold.
              </Typography>
            </section>

            <section>
              <Typography variant="h6">Q: What data do you store?</Typography>
              <Typography variant="body1">
                <ul>
                  <li>
                    We <b>do</b> store you login token in your browser for the app to work, <br/>
                    but it expires after an hour and you'll have to re-login.<br/>
                  </li>
                  <li>
                    We <b>do not</b> save any data provided by the Bungie.net API.<br/>
                    Our copy of your data is erased as soon as you close the browser tab.
                  </li>
                </ul>
              </Typography>
            </section>
          </div>
        </>
      )}


      {loading && (
        <Loading/>
      )}
    </Paper>
  );
});
