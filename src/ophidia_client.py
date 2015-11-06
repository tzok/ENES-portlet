#!/usr/bin/python

import os
import sys
import pycurl
import json
import argparse

def get_png(base_url,name,pwd,dst_output):

    from urllib import urlencode

    """
    Given base url, username and password, 
    provides the output file 
    """

    outfile = open(dst_output,'w')    

    #these are static for the moment
  
    userpwd="%s:%s" %(name,pwd)
    export_path="/export/misc/"
    png_name="precip_trend_analysis.png"

    static_public="http://193.204.199.174/devel/ncl/"

    png_url=base_url+export_path+png_name
    print png_url
    #png_url=static_public+png_name
    #print png_url

    target=pycurl.Curl()
    target.setopt(target.URL, str(png_url))
    target.setopt(target.WRITEFUNCTION, outfile.write)
    target.setopt(target.FOLLOWLOCATION, True)
    target.setopt(target.SSL_VERIFYPEER, 0)

    #post_data = {'username': name, 'password':pwd, 'submit':" Login "}
    #postfields = urlencode(post_data)
    #target.setopt(target.POSTFIELDS, postfields)

    try:
        target.perform()
        result=target.getinfo(pycurl.HTTP_CODE)
        target.close()

    except pycurl.error as e:
        err_msg="Failed download on %s (pycurl %s) !\n-----\n" % (png_url, e)
        sys.stderr.write(err_msg)
        print err_msg
        result="-1"
        
    if result == 200:
        return 0
    else:
        return 1


def grab_workflow_and_marker(fileStream):

    """ 
    Parses json stream, to grab workflow and marker IDs 
    """
    json_data=json.loads(fileStream)
    response=json_data["response"]["response"]
    values={'base_url':"",'workflow_id':-1,'marker_id':-1}

    workflow_status=response[0]['objcontent'][0]['message']
    if workflow_status == "OPH_STATUS_COMPLETED":

        workflow_responses=response[1]
        content=workflow_responses["objcontent"]
        rows=content[0]['rowvalues']

        for r in rows:
           if r[5] == "Create map":

              # I could take r[1] for the session but I prefer to parse
              # entirely the URL, so being independent from the web site
 
              values['base_url']=r[0].split('/experiment')[0]
              values['workflow_id']=r[2]
              values['marker_id']=r[3]
              
    return values

if __name__ == "__main__":

    parser= argparse.ArgumentParser (description='This script parses Ophidia JSON output and grabs the png image')
    parser.add_argument('json_input',help='Path to the json input file')
    parser.add_argument('oph_credentials',help='Path to the file containing username and password for Ophidia server')
    parser.add_argument('output_file',help='Path to the png output file')
    args=parser.parse_args()

    credentials=open(args.oph_credentials,'r').read()

    # this can be better refined
    cred=credentials.split(':')
    user=cred[0]
    pwd=cred[1]

    json_input=open(args.json_input,'r')

    d=grab_workflow_and_marker(json_input.read())

    # workflow_id and marker_id are currently unused
    # the url is almost static now 
    workflow_id=d['workflow_id']
    marker_id=d['marker_id']
    base_url=d['base_url']
    # https has not protection, apparently 
    base_url=base_url.replace('http','https')

    exit_code=get_png(base_url,user,pwd,args.output_file)
    sys.exit(exit_code)
    





