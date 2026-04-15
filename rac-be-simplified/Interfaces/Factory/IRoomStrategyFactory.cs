using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using rec_be.Interfaces.Strategy;
using rec_be.Models;

namespace rec_be.Interfaces.Factory
{
    public interface IRoomStrategyFactory
    {
        IRoomStrategy CreateStrategy(Room room);
    }
}