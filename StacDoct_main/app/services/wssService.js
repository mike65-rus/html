/**
 * Created by 1 on 26.11.2015.
 * WSS (WebSocket Service)
 */
define(['services/proxyService'],function(proxy){
    'use strict';

    function onError(error)  {
        proxy.publish("socketError",error);
    }
    function onClose(error)  {
        proxy.publish("socketClose",error);
    }
    function onMessage(data) {
        proxy.publish("socketMessage",data);
    }

    function SocketServer(url) {
        if (!(this instanceof SocketServer)) {
            throw new TypeError("SocketServer constructor cannot be called as a function.");
        }
        this.url=url;
        this._handShake=null;
        this._onOpenHandler=$.proxy(this.onOpen, this);

    }

    SocketServer.prototype={
        constructor:SocketServer,
        send: function(data) {
            if (this._connection) {
                this._connection.send(JSON.stringify(data));
            }
        },
        open: function(handShakeData) {
            if (handShakeData) {
                this._handShake=handShakeData;
            }
            try {
                this._connection=new WebSocket(this.url);
            }
            catch (ex) {
                this._connection=null;
            }
            if (!(this._connection==null)) {
                this._connection.onopen=this._onOpenHandler;
                this._connection.onerror=onError;
                this._connection.onclose=onClose;
                this._connection.onmessage=onMessage;
            }
            return !!(this._connection);
        },
        onOpen: function() {
            if (this._handShake) {
                this.send(this._handShake);
            }
        },
        close: function() {
            if (this._connection) {
                this._connection.close();
            }
        }
    };



    return SocketServer;
});