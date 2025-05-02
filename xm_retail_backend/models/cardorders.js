
import { Sequelize, DataTypes } from 'sequelize';
import {sequelize} from '../config/db.js'; 

const WoohooOrder = sequelize.define("WoohooOrder", {
      orderId: {
        type: DataTypes.STRING,
        // allowNull: false,
      },
      refno: {
        type: DataTypes.STRING,
        // allowNull: false,
      },
      sku: {
        type: DataTypes.STRING,
        // allowNull: false,
        defaultValue: null,
      },
      productName: DataTypes.STRING,
      amount: DataTypes.DECIMAL(10, 2),
      cardNumber: DataTypes.STRING,
      cardPin: DataTypes.STRING,
    //   validity: DataTypes.DATE,
    //   issuanceDate: DataTypes.DATE,
      recipientName: DataTypes.STRING,
      recipientEmail: DataTypes.STRING,
      recipientPhone: DataTypes.STRING,
      balance: DataTypes.DECIMAL(10, 2),
    });
  
    export default WoohooOrder;
  
  